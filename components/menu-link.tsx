import { useRouter } from "next/router";
interface MenuLinkProps {
  href: string;
  children: any;
  activatesDrawer?: boolean;
}
export const MenuLink = ({
  href,
  children,
  activatesDrawer = true,
}: MenuLinkProps) => {
  const router = useRouter();
  const { pathname } = router;
  return (
    <li onClick={() => router.push(href)}>
      <label
        htmlFor={activatesDrawer ? "my-drawer" : ""}
        className={
          (pathname.includes(href) ? "border border-gray-600" : "") +
          " py-4 btn btn-ghost  flex items-center justify-start text-left normal-case"
        }
      >
        {children}
      </label>
    </li>
  );
};
