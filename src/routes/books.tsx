import { LoaderFunctionArgs, useLoaderData, useRevalidator, useSearchParams } from "react-router-dom";
import { useMemo, useRef } from "react";
import type {
  ColDef,
  ICellRendererParams,
} from "ag-grid-community";
import { SearchIcon, TrashIcon } from "lucide-react";
import { Button, TextInput, Tooltip } from "@mantine/core";
import { BaseTable } from "../components";
import { AgGridReact } from "ag-grid-react";
import { useDeleteModalConfirmModal } from "../hooks";
import { useTranslation } from "react-i18next";
import { Book, deleteBook, fetchBooks } from "../actions";

interface LoaderData {
  books: Book[];
}

const defaultColDef: ColDef = {
  flex: 1,
  minWidth: 150,
  filter: true,
  floatingFilter: true,
  suppressHeaderMenuButton: true,
};

export default function Books() {
  const {books} = useLoaderData() as LoaderData;
  const gridRef = useRef<AgGridReact>(null);
  const {t} = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  
  const { confirmDeleteModal, openDeleteConfirmModal } =
    useDeleteModalConfirmModal({
      onConfirm: async (id) => {
        await deleteBook(id);
        revalidator.revalidate();
      }
    });

  const columns = useMemo(
    () =>
      [
        {
          field: "name",
          colId: "name",
          cellDataType: "text",
          headerName: t("name"),
        },
        {
          field: "author",
          colId: "author",
          cellDataType: "text",
          headerName: t("author"),
          valueFormatter: ({ value }) => value?.name,
          filterValueGetter: ({ data }) => data?.author?.name,
        },
        {
          field: "publish_year",
          colId: "publish_year",
          cellDataType: "text",
          headerName: t("publishedYear"),
          maxWidth: 80,
        },
        {
          field: "category",
          colId: "category",
          headerName: t("category"),
          valueFormatter: ({ value }) => value?.name,
          filterValueGetter: ({ data }) => data?.category?.name,
        },
        {
          field: "location",
          colId: "location",
          headerName: t("location"),
          valueFormatter: ({ value }) => value?.name,
          filterValueGetter: ({ data }) => data?.location?.name,
          maxWidth: 80,
        },
        {
          cellClass:
            "!flex !items-center !justify-center text-center place-content-center",
          headerClass: "place-content-center",
          editable: false,
          flex: 1,
          maxWidth: 140,
          headerName: t("actions"),
          suppressFloatingFilterButton: true,
          suppressFiltersToolPanel: true,
          suppressColumnsToolPanel: true,
          floatingFilter: false,
          filter: false,
          sortable: false,
          cellRenderer: ({ data }: ICellRendererParams) => {
            return (
              <div className="flex space-x-2 justify-center items-center w-full h-full">
                <Tooltip label={t("delete")}>
                  <Button
                    type="button"
                    size="sm"
                    variant="light"
                    color="red"
                    onClick={() =>
                      openDeleteConfirmModal(data.id)
                    }
                  >
                    <TrashIcon className="h-5 w-5 cursor-pointer" />
                  </Button>
                </Tooltip>
              </div>
            );
          },
        },
      ] satisfies ColDef<Book>[],
    [t, openDeleteConfirmModal],
  );


  return (
    <>
      {confirmDeleteModal}
      <TextInput
          radius="xl"
          size="md"
          placeholder={t("searchBooks")}
          rightSectionWidth={42}
          leftSection={<SearchIcon size={18} />}
          onChange={(event) => setSearchParams({ search: event.currentTarget.value })}
          value={searchParams.get("search") ?? ""}
        />
      <BaseTable
          rowData={books}
          defaultColDef={defaultColDef}
          columnDefs={columns}
          getRowId={({ data }) => data.id.toString()}
          ref={gridRef}
          pagination={true}
          paginationPageSize={50}
          wrapperClassName="h-[calc(100vh-138px)]"
        />
    </>

  );
}

export async function loader({request}: LoaderFunctionArgs): Promise<LoaderData> {
  const searchValue = new URL(request.url).searchParams.get('search') ?? undefined;
  return fetchBooks({ searchValue });
}