import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { AppNavigation } from "./components/app-navigation";
import { EditProgramModal } from "./components/edit-program.modal";
import { NewProgramModal } from "./components/new-program.modal";

export class ProgramsPage extends BasePage {
  readonly nav;
  readonly heading;
  readonly subtitle;
  readonly newProgramButton;
  readonly createProgramButton;
  readonly programColumnHeader;
  readonly table;
  readonly selectProgramHint;
  readonly newProgramModal;
  readonly editProgramModal;
  readonly emptyStateMessage;
  readonly mainRegion;
  readonly paginationNext;
  readonly programCountIndicator;
  readonly semesterHeading;
  readonly manageCoursesOrSemesterButton;
  readonly undoButton;
  readonly allRows;

  constructor(page: Page) {
    super(page);
    this.nav = new AppNavigation(page);
    this.heading = page.getByRole("heading", { name: "Programs" });
    this.subtitle = page.getByText("Manage academic programs and semesters");
    this.newProgramButton = page.getByRole("button", { name: "+ New Program" });
    this.createProgramButton = page.getByRole("button", { name: "Create Program" });
    this.programColumnHeader = page.getByRole("columnheader", { name: "Program" });
    this.table = page.getByRole("table");
    this.selectProgramHint = page.getByText("Select a program to manage semesters");
    this.newProgramModal = new NewProgramModal(page);
    this.editProgramModal = new EditProgramModal(page);
    this.emptyStateMessage = page.getByText(/no programs yet/i);
    this.mainRegion = page.getByRole("main");
    this.paginationNext = page.getByRole("button", { name: /next|page 2|›|»/i });
    this.programCountIndicator = page.getByText(/^\d+\s+Programs?$/i);
    this.semesterHeading = page.getByText(/semesters?/i).first();
    this.manageCoursesOrSemesterButton = page
      .getByRole("button", { name: /\+ Semester|Manage Courses/i })
      .first();
    this.undoButton = page.getByRole("button", { name: /undo/i });
    this.allRows = page.getByRole("row");
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}/programs`);
  }

  dataRows(): Locator {
    return this.page.getByRole("row").filter({ hasNotText: /^Program$/ });
  }

  programRow(name: string): Locator {
    return this.page.getByRole("row").filter({ hasText: name }).first();
  }

  programNameText(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  matchingRows(name: string): Locator {
    return this.page.getByRole("row").filter({ hasText: name });
  }

  rowsWithEditButtons(): Locator {
    return this.page.getByRole("row").filter({
      has: this.page.getByRole("button", { name: /^Edit / }),
    });
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.page.waitForURL("**/programs");
  }

  editButtonFor(programName: string): Locator {
    return this.page.getByRole("button", { name: `Edit ${programName}` });
  }

  deleteButtonFor(programName: string): Locator {
    return this.page.getByRole("button", { name: `Delete ${programName}` });
  }

  async openNewProgram(): Promise<void> {
    await this.newProgramButton.click();
  }

  async openEditFor(programName: string): Promise<void> {
    await this.editButtonFor(programName).click();
  }

  async deleteProgram(programName: string, acceptDialog = true): Promise<void> {
    this.page.once("dialog", async (dialog) => {
      if (acceptDialog) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    await this.deleteButtonFor(programName).click();
  }
}
