import ThreadLoader from "@/components/ThreadLoader";

export default function RouteLoading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <ThreadLoader text={title} detailText={description} />;
}
