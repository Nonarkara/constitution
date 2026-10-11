import Image from "next/image";
/** These drawings echo the surrounding text; screen readers can skip them. */
export function StudyArt({
  scene,
  compact = false,
}: {
  scene: "reading" | "listening" | "review";
  compact?: boolean;
}) {
  return (
    <figure
      className={"study-art" + (compact ? " study-art-compact" : "")}
      aria-hidden="true"
    >
      <Image
        src={`/illustrations/${scene}.webp`}
        alt=""
        width={720}
        height={720}
        sizes={
          compact
            ? "(max-width:720px) 100px, 150px"
            : "(max-width:720px) 120px, 180px"
        }
        priority={scene === "reading"}
      />
    </figure>
  );
}
