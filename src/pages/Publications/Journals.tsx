import PublicationList from '../../components/PublicationList';

export default function Journals() {
  return (
    <PublicationList
      heading="Journal Publications"
      description="Peer-reviewed research articles published in international journals."
      pageTitle="Journal Publications | Nafees Mansoor"
      metaDescription="Peer-reviewed research articles published in international journals by Dr. Nafees Mansoor."
      types={['journal']}
      emptyLabel="journal publications"
    />
  );
}
