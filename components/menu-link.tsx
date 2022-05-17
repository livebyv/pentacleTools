import { useRouter } from "next/router";

export const MenuLink = ({ href, children, activatesDrawer = true }) => {
    const router = useRouter();
    const { pathname } = router;
    return (
      <li onClick={() => router.push(href)}>
        <label
          htmlFor={activatesDrawer && "my-drawer"}
          className={
            (pathname.includes(href) ? "border border-gray-600" : "") +
            " py-4 inline-block btn btn-ghost text-left normal-case"
          }
        >
          {children}
        </label>
      </li>
    );
  };