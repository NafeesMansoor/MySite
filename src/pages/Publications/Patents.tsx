import PublicationList from '../../components/PublicationList';

export default function Patents() {
  return (
    <PublicationList
      heading="Patents"
      description="Intellectual property and innovations filed for patent protection."
      route="/publications/patent"
      types={['patent']}
      venueLabel="Status & Details"
      emptyLabel="patents"
    />
  );
}
