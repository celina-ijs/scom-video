import { IDataSchema } from "@ijstech/components";

export interface ICommand {
  execute(): void;
  undo(): void;
  redo(): void;
}

export interface IPageBlockAction {
	name: string;
	icon: string;
	command: (builder: any, userInputData: any) => ICommand;
	userInputDataSchema: IDataSchema;
}

export interface IData {
	url: string;
  showHeader?: boolean;
  showFooter?: boolean;
}
