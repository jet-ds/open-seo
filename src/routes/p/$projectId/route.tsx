import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@every-app/sdk/tanstack";
import { getProject } from "@/serverFunctions/keywords";

export const Route = createFileRoute("/p/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const params = Route.useParams();
  const { projectId } = params;
  const navigate = useNavigate();
  const user = useCurrentUser();

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject({ data: { projectId } }),
    enabled: user !== null,
  });

  useEffect(() => {
    if (user !== null && !isLoading && (isError || !project)) {
      void navigate({ to: "/" });
    }
  }, [isLoading, isError, project, navigate, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (!project) return null;

  return <Outlet />;
}
