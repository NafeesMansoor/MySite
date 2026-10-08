import PublicationList from '../../components/PublicationList';

export default function Patents() {
  return (
    <PublicationList
      heading="Patents"
      description="Intellectual property and innovations filed for patent protection."
      pageTitle="Patents | Nafees Mansoor"
      metaDescription="Intellectual property and innovations filed for patent protection by Dr. Nafees Mansoor."
      types={['patent']}
      venueLabel="Status & Details"
      emptyLabel="patents"
    />
  );
}
