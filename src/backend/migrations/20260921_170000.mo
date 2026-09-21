import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Category = {
    id : Nat;
    name : Text;
    createdAt : Int;
  };

  type ProductImage = {
    blob : Blob;
    filename : Text;
    mimeType : Text;
  };

  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    categoryId : Nat;
    description : Text;
    available : Bool;
    featured : Bool;
    images : [ProductImage];
    createdAt : Int;
    updatedAt : Int;
  };

  type StoreSettings = {
    shopName : Text;
    tagline : Text;
    phone : Text;
    whatsappNumber : Text;
    address : Text;
    openingHours : Text;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    categories : Map.Map<Nat, Category>;
    products : Map.Map<Nat, Product>;
    nextCategoryId : { var nextCategoryId : Nat };
    nextProductId : { var nextProductId : Nat };
    storeSettings : { var storeSettings : ?StoreSettings };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      categories = Map.empty();
      products = Map.empty();
      nextCategoryId = { var nextCategoryId = 0 };
      nextProductId = { var nextProductId = 0 };
      storeSettings = { var storeSettings = null };
    };
  };
};
