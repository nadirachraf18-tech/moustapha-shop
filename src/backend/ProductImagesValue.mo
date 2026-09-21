import OQL "mo:caffeineai-oql";

module {
  /// Collapses a product's image list to a single queryable text column: the
  /// object-storage references joined by a space. Filenames and MIME types are
  /// display metadata, not query dimensions.
  public func _toRow(self : [{ blob : Blob; filename : Text; mimeType : Text }]) : OQL.Value {
    #text(
      self.values().map(func img = img.blob.decodeUtf8() ?? "").join(" ")
    );
  };
};
