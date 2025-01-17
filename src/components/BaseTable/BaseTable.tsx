"use client";
import type { ColDef } from "ag-grid-community";

import { AgGridReact } from "ag-grid-react";
import type { AgGridReactProps } from "ag-grid-react";
import { forwardRef, useMemo } from "react";

import "./aggrid.css";
import "./ag-grid-theme-builder.css";
import { AG_GRID_LOCALE_CZ } from "@ag-grid-community/locale";
import { twMerge } from "tailwind-merge";

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface BaseTableProps extends AgGridReactProps {
	isDisabled?: boolean;
	wrapperClassName?: string;
}

const Table = forwardRef<AgGridReact, BaseTableProps>((props, ref) => {
	const { isDisabled, defaultColDef, wrapperClassName, ...restProps } = props;

	const defaultColDefInitial: ColDef = useMemo(
		() => ({
			autoHeaderHeight: true,
			resizable: true,
			sortable: true,
			useValueFormatterForExport: true,
			tooltipValueGetter: (params) => params?.value,
			filterParams: {
				textFormatter: (filterValue: string | null) => {
					if (filterValue == null) return null;

					return filterValue
						.toString()
						.toLowerCase()
						.replace(/á/g, "a")
						.replace(/[éě]/g, "e")
						.replace(/č/g, "c")
						.replace(/í/g, "i")
						.replace(/ň/g, "n")
						.replace(/ó/g, "o")
						.replace(/[ůú]/g, "u")
						.replace(/š/g, "s")
						.replace(/ř/g, "r")
						.replace(/ž/g, "z")
						.replace(/ý/g, "y");
				},
				inRangeInclusive: true,
			},
			...defaultColDef,
			singleClickEdit: true,
		}),
		[defaultColDef],
	);

	return (
		<div
			className={twMerge("ag-theme-custom w-full", "h-48", wrapperClassName)}
		>
			<AgGridReact
				className={twMerge(isDisabled && "ag-disabled")}
				ref={ref}
				headerHeight={30}
				groupHeaderHeight={30}
				defaultColDef={defaultColDefInitial}
				stopEditingWhenCellsLoseFocus
				localeText={AG_GRID_LOCALE_CZ}
				{...restProps}
			/>
		</div>
	);
});

export const BaseTable = Table;
