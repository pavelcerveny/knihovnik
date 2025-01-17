import { AppShell, Burger, Button, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BookOpen, MinusIcon, Plus, PlusIcon, UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { useEffect, useState } from "react";

async function zoomIn(zoom: number) {
  await getCurrentWebview().setZoom(zoom);
}

export default function Root() {
  const { t } = useTranslation();
  const [opened, { toggle }] = useDisclosure();
  const [zoom, setZoom] = useState(1);
  
  useEffect(() => {
    zoomIn(zoom);
  }, [zoom]);

  return (
    <>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 200,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header className="flex items-center justify-between">
        <div>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Link to="/">
            <div className="flex items-center gap-x-4 h-full pl-4">
                <BookOpen/>
                <div className="font-bold text-md">{t("appName")}</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 pr-4">
          <Button leftSection={<PlusIcon />} onClick={() => setZoom(zoom + 0.1)}>{t('zoomIn')}</Button>
          <Button leftSection={<MinusIcon />} onClick={() => setZoom(zoom - 0.1)}>{t('zoomOut')}</Button>
        </div>
        
      </AppShell.Header>

      <AppShell.Navbar p="md" className="gap-y-4">
        <NavLink
          component={Link}
          label={t("mainPage")}
          leftSection={<BookOpen />}
          to="/"
          variant="filled"
          active
        />
        <NavLink
          component={Link}
          label={t("addBook")}
          leftSection={<Plus />}
          to="/add-book"
          variant="filled"
          active
        />
        <NavLink
          component={Link}
          label={t("showAuthors")}
          leftSection={<UserIcon />}
          to="/authors"
          variant="filled"
          active
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
    </>
  );
}