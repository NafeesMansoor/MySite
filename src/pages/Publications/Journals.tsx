import PublicationList from '../../components/PublicationList';

export default function Journals() {
  return (
    <PublicationList
      heading="Journal Publications"
      description="Peer-reviewed research articles published in international journals."
      route="/publications/journals"
      types={['journal']}
      emptyLabel="journal publications"
    />
  );
}
