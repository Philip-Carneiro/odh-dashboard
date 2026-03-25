import {
  setupDefaults,
  handleUpdateLogic,
  translateDisplayNameForK8s,
  checkValidK8sName,
} from '../utils';

describe('translateDisplayNameForK8s', () => {
  it('should convert spaces to hyphens and lowercase', () => {
    expect(translateDisplayNameForK8s('My Registry Name')).toBe('my-registry-name');
  });

  it('should remove invalid characters', () => {
    expect(translateDisplayNameForK8s('Test@Registry#1')).toBe('testregistry1');
  });

  it('should trim whitespace', () => {
    expect(translateDisplayNameForK8s('  test  ')).toBe('test');
  });

  it('should return empty string for undefined', () => {
    expect(translateDisplayNameForK8s(undefined)).toBe('');
  });

  it('should prepend safe prefix when provided', () => {
    expect(translateDisplayNameForK8s('test', 'prefix-')).toBe('prefix-test');
  });
});

describe('checkValidK8sName', () => {
  it('should return valid for empty string', () => {
    expect(checkValidK8sName('')).toEqual({ valid: true, invalidCharacters: false });
  });

  it('should accept valid k8s names', () => {
    expect(checkValidK8sName('my-registry-1')).toEqual({ valid: true, invalidCharacters: false });
  });

  it('should reject names with uppercase characters', () => {
    const result = checkValidK8sName('MyRegistry');
    expect(result.valid).toBe(false);
    expect(result.invalidCharacters).toBe(true);
  });

  it('should reject names starting with a hyphen', () => {
    const result = checkValidK8sName('-my-registry');
    expect(result.valid).toBe(false);
  });

  it('should reject names ending with a hyphen', () => {
    const result = checkValidK8sName('my-registry-');
    expect(result.valid).toBe(false);
  });
});

describe('setupDefaults', () => {
  it('should initialize with default nameState', () => {
    const result = setupDefaults({});
    expect(result.nameState).toEqual({
      invalidLength: false,
      maxLength: 253,
    });
  });

  it('should detect invalid name length for initial data exceeding default max', () => {
    const longName = 'a'.repeat(254);
    const result = setupDefaults({ initialData: { name: longName } });
    expect(result.nameState.invalidLength).toBe(true);
  });

  it('should accept name at exactly max length', () => {
    const exactName = 'a'.repeat(253);
    const result = setupDefaults({ initialData: { name: exactName } });
    expect(result.nameState.invalidLength).toBe(false);
  });

  it('should respect custom maxNameLength', () => {
    const result = setupDefaults({ maxNameLength: 50 });
    expect(result.nameState.maxLength).toBe(50);
  });

  it('should detect invalid length with custom maxNameLength', () => {
    const result = setupDefaults({
      initialData: { name: 'a'.repeat(51) },
      maxNameLength: 50,
    });
    expect(result.nameState.invalidLength).toBe(true);
  });

  it('should initialize k8sName state correctly', () => {
    const result = setupDefaults({});
    expect(result.k8sName.state).toEqual({
      immutable: false,
      invalidCharacters: false,
      invalidLength: false,
      maxLength: 253,
      touched: false,
    });
  });

  it('should respect custom maxK8sNameLength', () => {
    const result = setupDefaults({ maxK8sNameLength: 63 });
    expect(result.k8sName.state.maxLength).toBe(63);
  });

  it('should set k8sName as immutable when pre-set and not editable', () => {
    const result = setupDefaults({ initialData: { k8sName: 'existing-name' } });
    expect(result.k8sName.state.immutable).toBe(true);
    expect(result.k8sName.state.touched).toBe(true);
  });

  it('should set k8sName as mutable when editableK8sName is true', () => {
    const result = setupDefaults({
      initialData: { k8sName: 'existing-name' },
      editableK8sName: true,
    });
    expect(result.k8sName.state.immutable).toBe(false);
  });
});

describe('handleUpdateLogic', () => {
  const baseData = setupDefaults({});

  describe('updating name', () => {
    it('should update name value', () => {
      const result = handleUpdateLogic(baseData)('name', 'My Registry');
      expect(result.name).toBe('My Registry');
    });

    it('should set invalidLength when name exceeds maxLength', () => {
      const longName = 'a'.repeat(254);
      const result = handleUpdateLogic(baseData)('name', longName);
      expect(result.nameState.invalidLength).toBe(true);
    });

    it('should not set invalidLength when name is within maxLength', () => {
      const result = handleUpdateLogic(baseData)('name', 'short name');
      expect(result.nameState.invalidLength).toBe(false);
    });

    it('should set invalidLength at exactly one over max', () => {
      const data = setupDefaults({ maxNameLength: 10 });
      const result = handleUpdateLogic(data)('name', 'a'.repeat(11));
      expect(result.nameState.invalidLength).toBe(true);
    });

    it('should not set invalidLength at exactly max', () => {
      const data = setupDefaults({ maxNameLength: 10 });
      const result = handleUpdateLogic(data)('name', 'a'.repeat(10));
      expect(result.nameState.invalidLength).toBe(false);
    });

    it('should auto-generate k8sName from name when not touched', () => {
      const result = handleUpdateLogic(baseData)('name', 'My Registry');
      expect(result.k8sName.value).toBe('my-registry');
    });

    it('should preserve k8sName when touched', () => {
      const touchedData = handleUpdateLogic(baseData)('k8sName', 'custom-name');
      const result = handleUpdateLogic(touchedData)('name', 'Different Name');
      expect(result.k8sName.value).toBe('custom-name');
    });
  });

  describe('updating k8sName', () => {
    it('should update k8sName value', () => {
      const result = handleUpdateLogic(baseData)('k8sName', 'my-custom-name');
      expect(result.k8sName.value).toBe('my-custom-name');
      expect(result.k8sName.state.touched).toBe(true);
    });

    it('should detect invalid characters in k8sName', () => {
      const result = handleUpdateLogic(baseData)('k8sName', 'Invalid_Name');
      expect(result.k8sName.state.invalidCharacters).toBe(true);
    });

    it('should detect k8sName exceeding maxLength', () => {
      const longName = 'a'.repeat(254);
      const result = handleUpdateLogic(baseData)('k8sName', longName);
      expect(result.k8sName.state.invalidLength).toBe(true);
    });
  });

  describe('updating description', () => {
    it('should update description value', () => {
      const result = handleUpdateLogic(baseData)('description', 'A description');
      expect(result.description).toBe('A description');
    });
  });
});
