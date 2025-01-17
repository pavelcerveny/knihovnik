import { Button, Tooltip } from "@mantine/core";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { TrashIcon } from "lucide-react";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { type Author, deleteAuthor, fetchAuthors } from "../actions";
import { BaseTable } from "../components";
import { useDeleteModalConfirmModal } from "../hooks";

interface LoaderData {
	authors: Author[];
}

const defaultColDef: ColDef = {
	flex: 1,
	minWidth: 150,
	filter: true,
	floatingFilter: true,
	suppressHeaderMenuButton: true,
};

export default function Authors() {
	const { authors } = useLoaderData() as LoaderData;
	const gridRef = useRef<AgGridReact>(null);
	const { t } = useTranslation();

	const revalidator = useRevalidator();

	const { confirmDeleteModal, openDeleteConfirmModal } =
		useDeleteModalConfirmModal({
			onConfirm: async (id) => {
				await deleteAuthor(id);
				revalidator.revalidate();
			},
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
										onClick={() => openDeleteConfirmModal(data.id)}
									>
										<TrashIcon className="h-5 w-5 cursor-pointer" />
									</Button>
								</Tooltip>
							</div>
						);
					},
				},
			] satisfies ColDef<Author>[],
		[t, openDeleteConfirmModal],
	);

	return (
		<>
			{confirmDeleteModal}
			<BaseTable
				rowData={authors}
				defaultColDef={defaultColDef}
				columnDefs={columns}
				getRowId={({ data }) => data.id.toString()}
				ref={gridRef}
				pagination={true}
				paginationPageSize={50}
				wrapperClassName="h-[calc(100vh-96px)]"
			/>
		</>
	);
}

export async function loader(): Promise<LoaderData> {
	return fetchAuthors();
}
