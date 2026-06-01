import type { Page } from "@playwright/test";

export class EditProgramModal {
  readonly dialog;
  readonly programNameInput;
  readonly descriptionInput;
  readonly cancelButton;
  readonly saveButton;
  readonly showAiConfigButton;
  readonly textboxes;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("dialog", { name: "Edit Program" });
    this.programNameInput = this.dialog.getByRole("textbox", { name: "Program Name" });
    this.descriptionInput = this.dialog.getByRole("textbox", { name: "Description" });
    this.cancelButton = this.dialog.getByRole("button", { name: "Cancel" });
    this.saveButton = this.dialog.getByRole("button", { name: "Save" });
    this.showAiConfigButton = this.dialog.getByRole("button", {
      name: /Show AI Generation Config/i,
    });
    this.textboxes = this.dialog.getByRole("textbox");
  }

  async fill(name: string, description: string): Promise<void> {
    await this.programNameInput.fill(name);
    await this.descriptionInput.fill(description);
  }

  async clearAndFillName(name: string): Promise<void> {
    await this.programNameInput.clear();
    await this.programNameInput.fill(name);
  }

  async clearAndFillDescription(description: string): Promise<void> {
    await this.descriptionInput.clear();
    await this.descriptionInput.fill(description);
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
