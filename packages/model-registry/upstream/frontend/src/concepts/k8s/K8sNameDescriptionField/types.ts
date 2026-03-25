export type K8sNameDescriptionFieldData = {
  name: string;
  description: string;
  nameState: {
    invalidLength: boolean;
    maxLength: number;
  };
  k8sName: {
    value: string;
    state: {
      immutable: boolean;
      invalidCharacters: boolean;
      invalidLength: boolean;
      maxLength: number;
      touched: boolean;
    };
  };
};

export type K8sNameDescriptionType = {
  name?: string;
  k8sName?: string;
  description?: string;
};

export type UseK8sNameDescriptionDataConfiguration = {
  initialData?: K8sNameDescriptionType;
  editableK8sName?: boolean;
  maxK8sNameLength?: number;
  maxNameLength?: number;
};

type K8sNameDescriptionFieldUpdateFunctionTemplate<T> = (
  key: keyof K8sNameDescriptionFieldData,
  value: string,
) => T;

export type K8sNameDescriptionFieldUpdateFunction =
  K8sNameDescriptionFieldUpdateFunctionTemplate<void>;

export type K8sNameDescriptionFieldUpdateFunctionInternal =
  K8sNameDescriptionFieldUpdateFunctionTemplate<K8sNameDescriptionFieldData>;

export type UseK8sNameDescriptionFieldData = {
  data: K8sNameDescriptionFieldData;
  onDataChange: K8sNameDescriptionFieldUpdateFunction;
};
