import { Contact } from "./Company";

export interface ModalInterface {
  readonly handleSaveChanges: () => void;
  readonly handleCloseModal: () => void;
  readonly openModal: boolean;
  readonly title?: string;
  readonly noHeader?: boolean;
  readonly saveText?: string;
  readonly saveBtnLoading?: boolean;
  readonly cancelText?: string;
  readonly data?: Contact;
  readonly checkBox?: {
    readonly text: string;
    readonly value: boolean;
    readonly handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
}
