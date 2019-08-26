import { FunctionalComponent as SFC, h } from "@stencil/core";
import { SliderItem } from "./models";

export const SliderCardItem: SFC<SliderItem> = ({ link, title, summary }) => (
  <div>
    <h2>
      <a href={link}> {title} </a>
    </h2>
    <p>{summary}</p>
  </div>
);
