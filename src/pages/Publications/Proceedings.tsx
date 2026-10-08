import PublicationList from '../../components/PublicationList';

export default function Proceedings() {
  return (
    <PublicationList
      heading="Conference Proceedings"
      description="Research papers presented at international conferences and symposia."
      pageTitle="Conference Proceedings | Nafees Mansoor"
      metaDescription="Research papers presented at international conferences and symposia by Dr. Nafees Mansoor."
      types={['conference']}
      emptyLabel="conference papers"
    />
  );
}
