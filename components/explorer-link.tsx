export function ExplorerLink({ txId }: { txId: string }) {
  return (
    <a href={`https://solscan.io/tx/${txId}`} target="_blank" rel="noopener noreferrer"
    >
      See on explorer
    </a>
  );
}
