import { Button, Group, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

interface UseDeleteModalConfirmModalProps<T> {
	initialData?: T;
	onConfirm?: (data: T) => unknown;
	onCancel?: (data: T) => unknown;
}

export function useDeleteModalConfirmModal<T>(
	props: UseDeleteModalConfirmModalProps<T>,
) {
	const { t } = useTranslation();
	const { initialData, onConfirm, onCancel } = props;
	const [data, setData] = useState<T | undefined>(initialData);

	const [opened, { open, close }] = useDisclosure(false);

	const openDeleteConfirmModal = useCallback(
		async (openData: T) => {
			if (typeof openData === "function") {
				setData(() => openData);
			} else {
				setData(openData);
			}

			open();
		},
		[open],
	);

	const closeDeleteConfirmModal = useCallback(() => {
		setData(undefined);
		close();
	}, [close]);

	const handleConfirm = useCallback(() => {
		onConfirm?.(data!);
		closeDeleteConfirmModal();
	}, [closeDeleteConfirmModal, data, onConfirm]);

	const handleCancel = useCallback(() => {
		onCancel?.(data!);
		closeDeleteConfirmModal();
	}, [onCancel, data, closeDeleteConfirmModal]);

	const confirmDeleteModal = (
		<Modal opened={opened} onClose={close} title={t("bookDeleteConfirm")}>
			<span>Opravdu chcete odstranit?</span>
			<Group mt="lg" justify="flex-end">
				<Button
					onClick={() => {
						handleCancel?.();
						close();
					}}
					variant="default"
				>
					Zrusit
				</Button>
				<Button
					onClick={() => {
						handleConfirm?.();
						close();
					}}
					color="red"
				>
					Smazat
				</Button>
			</Group>
		</Modal>
	);

	return {
		closeDeleteConfirmModal,
		openDeleteConfirmModal,
		confirmDeleteModal,
	};
}
