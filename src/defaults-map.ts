export class DefaultsMap<K, V> extends Map<K, V> {
  private readonly generateDefault: (key: K) => V;

  constructor(defaultGenerator: (key: K) => V) {
    super();
    this.generateDefault = defaultGenerator;
  }

  override get(key: K): V {
    let value = super.get(key);
    if (value !== undefined) return value;
    value = this.generateDefault(key);
    this.set(key, value);
    return value;
  }
}
