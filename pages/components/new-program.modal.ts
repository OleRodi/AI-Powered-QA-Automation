import type { Page } from "@playwright/test";

export class NewProgramModal {
  readonly dialog;
  readonly programNameInput;
  readonly descriptionInput;
  readonly cancelButton;
  readonly createButton;
  readonly showAiConfigButton;
  readonly duplicateNameError;
  readonly maxLengthError;
  readonly textboxes;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("dialog", { name: "New Program" });
    this.programNameInput = this.dialog.getByRole("textbox", { name: "Program Name" });
    this.descriptionInput = this.dialog.getByRole("textbox", { name: "Description" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.createButton = this.dialog.getByRole("button", { name: "Create", exact: true });
    this.showAiConfigButton = this.dialog.getByRole("button", {
      name: /Show AI Generation Config/i,
    });
    this.duplicateNameError = this.dialog
      .getByText(/duplicate|already exists|unique|name.*taken/i)
      .first();
    this.maxLengthError = this.dialog
      .getByText(/too long|maximum|max length|characters/i)
      .first();
    this.textboxes = this.dialog.getByRole("textbox");
  }

  async fill(name: string, description: string): Promise<void> {
    await this.programNameInput.fill(name);
    await this.descriptionInput.fill(description);
  }

  async fillName(name: string): Promise<void> {
    await this.programNameInput.fill(name);
  }

  async fillDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async submit(): Promise<void> {
    await this.createButton.click();
  }

  async submitDoubleClick(): Promise<void> {
    await this.createButton.dblclick();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
