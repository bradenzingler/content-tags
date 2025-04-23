// import SideNav from "@/app/components/docs/SideNav";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { describe, expect, test } from "vitest";

// describe("Docs page side nav", () => {

//     test("renders side nav with correct sections", () => {
//         const sections = {
//             "getting-started": {
//                 navTitle: "Getting started",
//                 title: "Understand, categorize, and label your content",
//                 content: <div>Content for getting started</div>,
//             },
//             "image-tags": {
//                 navTitle: "Image tags",
//                 title: "Image Tags",
//                 content: <div>Content for image tags</div>,
//             },
//         };

//         const setActiveSection = vi.fn();

//         render(
//             <SideNav
//                 sections={sections}
//                 activeSection="getting-started"
//                 setActiveSection={setActiveSection}
//             />
//         );

//         expect(screen.getByText("Documentation")).toBeInTheDocument();
//         expect(screen.getByText("Getting started")).toBeInTheDocument();
//         expect(screen.getByText("Image tags")).toBeInTheDocument();
//     });

// });