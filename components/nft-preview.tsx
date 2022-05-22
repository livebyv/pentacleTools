
export function NFTPreview({
  nft,
  selectable = false,
  selected = false,
  handleNFTSelect = (...args: any) => {},
}) {
  return (
    <>
      <strong
        className={`text-center truncate max-w-full ${selectable && "mr-6"}`}
      >
        {nft.metadata?.name || nft?.tokenData?.name}
      </strong>
      <div className="w-full bg-black flex items-center justify-center rounded-lg">
        {selectable && (
          <input
            type="checkbox"
            className="checkbox absolute right-2 top-2"
            onClick={() => handleNFTSelect(nft.mint)}
            defaultChecked={selected}
          />
        )}
        {nft.image ? (
          // eslint-disable-next-line
          <img
            src={nft?.image}
            alt=""
            className="w-full block h-32 object-contain "
          />
        ) : (
          <div className="flex items-center justify-center h-32">
            <svg
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="48px"
              height="48px"
            >
              <path d="M 5.484375 3.984375 A 1.50015 1.50015 0 0 0 4.4394531 6.5605469 L 14.761719 16.882812 L 4.5703125 35.294922 C 2.9376946 38.244782 5.1480864 42 8.5195312 42 L 39.482422 42 C 39.606894 42 39.725681 41.978494 39.847656 41.96875 L 41.439453 43.560547 A 1.50015 1.50015 0 1 0 43.560547 41.439453 L 25.189453 23.068359 A 1.50015 1.50015 0 0 0 24.90625 22.785156 L 6.5605469 4.4394531 A 1.50015 1.50015 0 0 0 5.484375 3.984375 z M 24 5 C 22.334 5 20.858781 5.870125 20.050781 7.328125 L 17.783203 11.421875 L 19.992188 13.628906 L 22.675781 8.78125 C 23.066781 8.07625 23.732 8 24 8 C 24.268 8 24.933219 8.07625 25.324219 8.78125 L 37.949219 31.585938 L 43.962891 37.597656 C 43.989891 36.803656 43.827641 36.010922 43.431641 35.294922 L 27.949219 7.328125 C 27.142219 5.871125 25.666 5 24 5 z M 24 16 C 23.551 16 23.151953 16.200672 22.876953 16.513672 L 25.5 19.136719 L 25.5 17.5 C 25.5 16.671 24.829 16 24 16 z M 16.96875 19.089844 L 22.5 24.621094 L 22.5 27.5 A 1.50015 1.50015 0 0 0 25.496094 27.617188 L 36.878906 39 L 8.5195312 39 C 7.2969763 39 6.6019304 37.820187 7.1953125 36.748047 L 16.96875 19.089844 z M 24 32 A 2 2 0 0 0 24 36 A 2 2 0 0 0 24 32 z" />
            </svg>
          </div>
        )}
        {nft?.metadata?.animation_url ? (
          <video width={100} height={300} autoPlay loop>
            <source src={nft?.metadata?.animation_url} />
          </video>
        ) : null}
      </div>
    </>
  );
}