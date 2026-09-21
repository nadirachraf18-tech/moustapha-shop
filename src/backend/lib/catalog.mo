import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Result "mo:core/Result";
import Types "../types/catalog";

module {
  /// Maximum number of related products returned for a product detail page.
  let relatedLimit : Nat = 4;

  /// Default storefront settings for Moustapha Shop, used until an admin saves
  /// their own values.
  public func defaultStoreSettings() : Types.StoreSettings {
    {
      shopName = "Moustapha Shop";
      tagline = "متجرك المفضل";
      phone = "";
      whatsappNumber = "";
      address = "";
      openingHours = "";
    };
  };

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  public func listCategories(categories : Map.Map<Types.CategoryId, Types.Category>) : [Types.Category] {
    let all = categories.values().toArray();
    all.sort(func(a, b) = Text.compare(a.name, b.name));
  };

  public func createCategory(
    categories : Map.Map<Types.CategoryId, Types.Category>,
    nextCategoryId : { var nextCategoryId : Nat },
    name : Text,
  ) : Result.Result<Types.Category, Types.CatalogError> {
    let trimmed = name.trim(#char ' ');
    if (trimmed.size() == 0) {
      return #err(#invalidInput("Category name must not be empty"));
    };
    let duplicate = categories.values().any(func(c) = c.name.toLower() == trimmed.toLower());
    if (duplicate) {
      return #err(#duplicateName);
    };
    let id = nextCategoryId.nextCategoryId;
    nextCategoryId.nextCategoryId := id + 1;
    let category : Types.Category = { id; name = trimmed; createdAt = Time.now() };
    categories.add(id, category);
    #ok(category);
  };

  public func renameCategory(
    categories : Map.Map<Types.CategoryId, Types.Category>,
    id : Types.CategoryId,
    name : Text,
  ) : Result.Result<Types.Category, Types.CatalogError> {
    let existing = categories.get(id) ?? return #err(#notFound);
    let trimmed = name.trim(#char ' ');
    if (trimmed.size() == 0) {
      return #err(#invalidInput("Category name must not be empty"));
    };
    let duplicate = categories.values().any(
      func(c) = c.id != id and c.name.toLower() == trimmed.toLower()
    );
    if (duplicate) {
      return #err(#duplicateName);
    };
    let updated : Types.Category = { existing with name = trimmed };
    categories.add(id, updated);
    #ok(updated);
  };

  public func deleteCategory(
    categories : Map.Map<Types.CategoryId, Types.Category>,
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.CategoryId,
  ) : Result.Result<(), Types.CatalogError> {
    switch (categories.get(id)) {
      case null { return #err(#notFound) };
      case (?_) {};
    };
    let inUse = products.values().any(func(p) = p.categoryId == id);
    if (inUse) {
      return #err(#categoryInUse);
    };
    categories.remove(id);
    #ok(());
  };

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  public func listProducts(
    products : Map.Map<Types.ProductId, Types.Product>,
    filter : Types.ProductFilter,
  ) : [Types.Product] {
    let term = switch (filter.search) {
      case (?s) { ?s.trim(#char ' ').toLower() };
      case null { null };
    };
    let matched = products.values().toArray().filter(
      func(p) {
        let categoryOk = switch (filter.categoryId) {
          case (?cid) { p.categoryId == cid };
          case null { true };
        };
        let searchOk = switch (term) {
          case (?t) {
            t.size() == 0 or p.name.toLower().contains(#text t) or p.description.toLower().contains(#text t);
          };
          case null { true };
        };
        categoryOk and searchOk;
      }
    );
    sortProducts(matched, filter.sort);
  };

  public func getProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.ProductId,
  ) : ?Types.Product {
    products.get(id);
  };

  public func listFeaturedProducts(products : Map.Map<Types.ProductId, Types.Product>) : [Types.Product] {
    let featured = products.values().toArray().filter(func(p) = p.featured);
    sortProducts(featured, ?#newest);
  };

  public func listRelatedProducts(
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.ProductId,
  ) : [Types.Product] {
    switch (products.get(id)) {
      case null { [] };
      case (?product) {
        let related = products.values().toArray().filter(
          func(p) = p.id != id and p.categoryId == product.categoryId
        );
        let sorted = sortProducts(related, ?#newest);
        if (sorted.size() > relatedLimit) {
          sorted.sliceToArray(0, relatedLimit);
        } else {
          sorted;
        };
      };
    };
  };

  public func createProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    categories : Map.Map<Types.CategoryId, Types.Category>,
    nextProductId : { var nextProductId : Nat },
    input : Types.ProductInput,
  ) : Result.Result<Types.Product, Types.CatalogError> {
    let name = input.name.trim(#char ' ');
    if (name.size() == 0) {
      return #err(#invalidInput("Product name must not be empty"));
    };
    if (input.price == 0) {
      return #err(#invalidInput("Product price must be greater than zero"));
    };
    switch (categories.get(input.categoryId)) {
      case null { return #err(#invalidInput("Category does not exist")) };
      case (?_) {};
    };
    let now = Time.now();
    let id = nextProductId.nextProductId;
    nextProductId.nextProductId := id + 1;
    let product : Types.Product = {
      id;
      name;
      price = input.price;
      categoryId = input.categoryId;
      description = input.description;
      available = input.available;
      featured = input.featured;
      images = input.images;
      createdAt = now;
      updatedAt = now;
    };
    products.add(id, product);
    #ok(product);
  };

  public func updateProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    categories : Map.Map<Types.CategoryId, Types.Category>,
    id : Types.ProductId,
    update : Types.ProductUpdate,
  ) : Result.Result<Types.Product, Types.CatalogError> {
    let existing = products.get(id) ?? return #err(#notFound);

    let name = switch (update.name) {
      case (?n) {
        let trimmed = n.trim(#char ' ');
        if (trimmed.size() == 0) {
          return #err(#invalidInput("Product name must not be empty"));
        };
        trimmed;
      };
      case null { existing.name };
    };

    let price = switch (update.price) {
      case (?p) {
        if (p == 0) {
          return #err(#invalidInput("Product price must be greater than zero"));
        };
        p;
      };
      case null { existing.price };
    };

    let categoryId = switch (update.categoryId) {
      case (?cid) {
        switch (categories.get(cid)) {
          case null { return #err(#invalidInput("Category does not exist")) };
          case (?_) {};
        };
        cid;
      };
      case null { existing.categoryId };
    };

    let updated : Types.Product = {
      existing with
      name;
      price;
      categoryId;
      description = update.description ?? existing.description;
      available = update.available ?? existing.available;
      featured = update.featured ?? existing.featured;
      images = update.images ?? existing.images;
      updatedAt = Time.now();
    };
    products.add(id, updated);
    #ok(updated);
  };

  public func deleteProduct(
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.ProductId,
  ) : Result.Result<(), Types.CatalogError> {
    switch (products.get(id)) {
      case null { return #err(#notFound) };
      case (?_) {};
    };
    products.remove(id);
    #ok(());
  };

  public func setProductAvailability(
    products : Map.Map<Types.ProductId, Types.Product>,
    id : Types.ProductId,
    available : Bool,
  ) : Result.Result<Types.Product, Types.CatalogError> {
    let existing = products.get(id) ?? return #err(#notFound);
    let updated : Types.Product = { existing with available; updatedAt = Time.now() };
    products.add(id, updated);
    #ok(updated);
  };

  // ---------------------------------------------------------------------------
  // Store settings
  // ---------------------------------------------------------------------------

  public func getStoreSettings(state : { var storeSettings : ?Types.StoreSettings }) : Types.StoreSettings {
    state.storeSettings ?? defaultStoreSettings();
  };

  public func updateStoreSettings(
    state : { var storeSettings : ?Types.StoreSettings },
    settings : Types.StoreSettings,
  ) : Result.Result<Types.StoreSettings, Types.CatalogError> {
    if (settings.shopName.trim(#char ' ').size() == 0) {
      return #err(#invalidInput("Shop name must not be empty"));
    };
    state.storeSettings := ?settings;
    #ok(settings);
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  func sortProducts(products : [Types.Product], sort : ?Types.ProductSort) : [Types.Product] {
    switch (sort) {
      case (?#priceLowToHigh) {
        products.sort(func(a, b) = Nat.compare(a.price, b.price));
      };
      case (?#priceHighToLow) {
        products.sort(func(a, b) = Nat.compare(b.price, a.price));
      };
      case (?#newest) {
        products.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
      };
      case null {
        products.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
      };
    };
  };
};
