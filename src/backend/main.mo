import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import IntValue "mo:caffeineai-oql/IntValue";
import ProductImagesValue "ProductImagesValue";
import Types "types/catalog";
import CatalogApiMixin "mixins/catalog-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  let categories : Map.Map<Types.CategoryId, Types.Category>;
  let products : Map.Map<Types.ProductId, Types.Product>;
  let nextCategoryId : { var nextCategoryId : Nat };
  let nextProductId : { var nextProductId : Nat };
  let storeSettings : { var storeSettings : ?Types.StoreSettings };

  include CatalogApiMixin(
    accessControlState,
    categories,
    products,
    nextCategoryId,
    nextProductId,
    storeSettings,
  );
  include ApiDocMixin();
  include Expose({
    entities = [
      categories.toEntity("category", "Category", "id")
        .sample({ id = 0; name = ""; createdAt = 0 })
        .public_()
        .build(),
      products.toEntity("product", "Product", "id")
        .sample({
          id = 0;
          name = "";
          price = 0;
          categoryId = 0;
          description = "";
          available = false;
          featured = false;
          images = [];
          createdAt = 0;
          updatedAt = 0;
        })
        .public_()
        .build(),
    ];
  });
};
