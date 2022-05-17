export function ExplorerLink({ txId }: { txId: string }) {
  return (
    <a href={`https://solscan.io/tx/${txId}`} target="_blank" rel="noreferrer">
      See on explorer
    </a>
  );
}
