import { AppShell, Burger, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BookOpen, Plus, UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";

export default function Root() {
  const { t } = useTranslation();
  const [opened, { toggle }] = useDisclosure();

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
      <AppShell.Header>
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