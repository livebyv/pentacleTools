export function FireIcon({ width = 16, height = 16, ...props }) {
  return (
    <svg
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width}
      height={height}
      {...props}
    >
      <path d="M 12 1 C 12 1 4 8 4 14 C 4 18.418 7.582 22 12 22 C 16.418 22 20 18.418 20 14 C 20 8 12 1 12 1 z M 12.001953 3.7558594 C 14.402953 6.1798594 18 10.552 18 14 C 18 17.308 15.308 20 12 20 C 8.692 20 6 17.308 6 14 C 6 10.564 9.5999531 6.1848594 12.001953 3.7558594 z M 12 20 C 13.657 20 15 18.657 15 17 C 15 14 12 11 12 11 C 12 11 9 14 9 17 C 9 18.657 10.343 20 12 20 z" />
    </svg>
  );
}
