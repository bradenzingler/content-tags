import Image from "next/image";
import Link from "next/link";

export default function StoryPreview({
	coverImageSrc,
	tags,
	date,
	author,
	description,
	title,
}: {
	coverImageSrc: string;
    tags: string[];
    date: string;
    author: string;
    description: string;
    title: string;
}) {
    return (
        <Link href={title.replaceAll(" ", "-")} title={title}>
            <Image src={coverImageSrc} title={title} alt={title} width={100} height={100} />
            <h3>{title}</h3>
            <h4>{description}</h4>
            <p>Published on {date}</p>
            <p>Written by {author}</p>
        </Link>
    );
}
