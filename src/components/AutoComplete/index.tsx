import {
	Combobox,
	type ComboboxProps,
	InputBase,
	type InputBaseProps,
	useCombobox,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface GetInputPropsReturnType {
	onChange: any;
	value?: any;
	defaultValue?: any;
	checked?: any;
	error?: any;
	onFocus?: any;
	onBlur?: any;
}

type InputProps = InputBaseProps & GetInputPropsReturnType;

interface AutoCompleteProps extends InputProps {
	items: { id: string; label: string }[];
	comboboxProps?: ComboboxProps;
}

export function AutoComplete(props: AutoCompleteProps) {
	const {
		items,
		comboboxProps,
		value: defaultValue,
		...restInputProps
	} = props;

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const { t } = useTranslation();

	const [, setValue] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	const defaultValueRef = useRef(false);

	useEffect(() => {
		if (defaultValueRef.current === false) {
			// when adding new book, default value is set to undefined
			if (defaultValue === undefined) {
				defaultValueRef.current = true;
			}
			if (defaultValue && items.length > 0) {
				setSearch(
					defaultValue
						? (items.find(({ id }) => id === defaultValue)?.label ?? "")
						: "",
				);
				defaultValueRef.current = true;
			}
		}
	}, [defaultValue, items]);

	const options = items
		.filter(({ label }) =>
			label.toLocaleLowerCase().includes(search.toLocaleLowerCase().trim()),
		)
		.map(({ id, label }) => (
			<Combobox.Option
				value={id}
				key={id}
				active={id.toString() === defaultValue?.toString()}
			>
				{label}
			</Combobox.Option>
		));

	return (
		<Combobox
			store={combobox}
			withinPortal={false}
			onOptionSubmit={(val) => {
				setValue(val);
				const selectedOption = items.find((item) => item.id === val);
				setSearch(selectedOption?.label ?? "");
				restInputProps.onChange?.(val);
				combobox.closeDropdown();
			}}
			{...comboboxProps}
		>
			<Combobox.Target>
				<InputBase
					{...restInputProps}
					value={search}
					rightSection={<Combobox.Chevron />}
					onChange={(event) => {
						combobox.openDropdown();
						combobox.updateSelectedOptionIndex();
						setSearch(event.currentTarget.value);
						restInputProps.onChange?.(event.currentTarget.value);
					}}
					onClick={() => combobox.openDropdown()}
					onFocus={() => combobox.openDropdown()}
					onBlur={() => {
						combobox.closeDropdown();
						restInputProps.onBlur();
					}}
					placeholder={t("search")}
					rightSectionPointerEvents="none"
				/>
			</Combobox.Target>

			{options.length > 0 && combobox.dropdownOpened && (
				<Combobox.Dropdown>
					<Combobox.Options>{options}</Combobox.Options>
				</Combobox.Dropdown>
			)}
		</Combobox>
	);
}
