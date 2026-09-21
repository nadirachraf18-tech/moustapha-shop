import Map "mo:core/Map";
import Result "mo:core/Result";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/catalog";
import CatalogLib "../lib/catalog";

mixin (
  accessControlState : AccessControl.AccessControlState,
  categories : Map.Map<Types.CategoryId, Types.Category>,
  products : Map.Map<Types.ProductId, Types.Product>,
  nextCategoryId : { var nextCategoryId : Nat },
  nextProductId : { var nextProductId : Nat },
  storeSettings : { var storeSettings : ?Types.StoreSettings },
) {
  // ---------------------------------------------------------------------------
  // Categories — public reads
  // ---------------------------------------------------------------------------

  public query func listCategories() : async [Types.Category] {
    CatalogLib.listCategories(categories);
  };

  // ---------------------------------------------------------------------------
  // Categories — admin mutations
  // ---------------------------------------------------------------------------

  public shared ({ caller }) func createCategory(name : Text) : async Result.Result<Types.Category, Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.createCategory(categories, nextCategoryId, name);
  };

  public shared ({ caller }) func renameCategory(id : Types.CategoryId, name : Text) : async Result.Result<Types.Category, Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.renameCategory(categories, id, name);
  };

  public shared ({ caller }) func deleteCategory(id : Types.CategoryId) : async Result.Result<(), Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.deleteCategory(categories, products, id);
  };

  // ---------------------------------------------------------------------------
  // Products — public reads
  // ---------------------------------------------------------------------------

  public query func listProducts(filter : Types.ProductFilter) : async [Types.Product] {
    CatalogLib.listProducts(products, filter);
  };

  public query func getProduct(id : Types.ProductId) : async ?Types.Product {
    CatalogLib.getProduct(products, id);
  };

  public query func listFeaturedProducts() : async [Types.Product] {
    CatalogLib.listFeaturedProducts(products);
  };

  public query func listRelatedProducts(id : Types.ProductId) : async [Types.Product] {
    CatalogLib.listRelatedProducts(products, id);
  };

  // ---------------------------------------------------------------------------
  // Products — admin mutations
  // ---------------------------------------------------------------------------

  public shared ({ caller }) func createProduct(input : Types.ProductInput) : async Result.Result<Types.Product, Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.createProduct(products, categories, nextProductId, input);
  };

  public shared ({ caller }) func updateProduct(id : Types.ProductId, update : Types.ProductUpdate) : async Result.Result<Types.Product, Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.updateProduct(products, categories, id, update);
  };

  public shared ({ caller }) func deleteProduct(id : Types.ProductId) : async Result.Result<(), Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.deleteProduct(products, id);
  };

  public shared ({ caller }) func setProductAvailability(id : Types.ProductId, available : Bool) : async Result.Result<Types.Product, Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.setProductAvailability(products, id, available);
  };

  // ---------------------------------------------------------------------------
  // Store settings
  // ---------------------------------------------------------------------------

  public query func getStoreSettings() : async Types.StoreSettings {
    CatalogLib.getStoreSettings(storeSettings);
  };

  public shared ({ caller }) func updateStoreSettings(settings : Types.StoreSettings) : async Result.Result<Types.StoreSettings, Types.CatalogError> {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err(#notAuthorized);
    };
    CatalogLib.updateStoreSettings(storeSettings, settings);
  };
};
