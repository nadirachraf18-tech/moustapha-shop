import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type ProductId = Common.ProductId;
  public type CategoryId = Common.CategoryId;
  public type Timestamp = Common.Timestamp;

  /// A product image stored via the platform object-storage extension.
  /// `blob` is the external reference; `filename` and `mimeType` are kept for
  /// display and file-type detection (never inspect the blob URL for a type).
  public type ProductImage = {
    blob : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
  };

  /// A product as stored and returned by the API.
  public type Product = {
    id : ProductId;
    name : Text;
    price : Nat;
    categoryId : CategoryId;
    description : Text;
    available : Bool;
    featured : Bool;
    images : [ProductImage];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// A product category.
  public type Category = {
    id : CategoryId;
    name : Text;
    createdAt : Timestamp;
  };

  /// Storefront settings shown on the home page.
  public type StoreSettings = {
    shopName : Text;
    tagline : Text;
    phone : Text;
    whatsappNumber : Text;
    address : Text;
    openingHours : Text;
  };

  /// Sort order for product listings.
  public type ProductSort = {
    #newest;
    #priceLowToHigh;
    #priceHighToLow;
  };

  /// Filter and sort options for `listProducts`.
  public type ProductFilter = {
    categoryId : ?CategoryId;
    search : ?Text;
    sort : ?ProductSort;
  };

  /// Input for creating a product.
  public type ProductInput = {
    name : Text;
    price : Nat;
    categoryId : CategoryId;
    description : Text;
    available : Bool;
    featured : Bool;
    images : [ProductImage];
  };

  /// Input for updating a product. `null` leaves the field unchanged.
  public type ProductUpdate = {
    name : ?Text;
    price : ?Nat;
    categoryId : ?CategoryId;
    description : ?Text;
    available : ?Bool;
    featured : ?Bool;
    images : ?[ProductImage];
  };

  /// Errors returned by catalog mutations.
  public type CatalogError = {
    #notAuthorized;
    #notFound;
    #invalidInput : Text;
    #categoryInUse;
    #duplicateName;
  };
};
