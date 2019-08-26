import { FunctionalComponent as SFC, h } from "@stencil/core";
import { SliderItem } from "./models";

interface NovaSliderMarkupProps {
  mode: string;
  variant: string;
  axis: string;
  items: SliderItem[];
  SliderItemComponent: any;
}

export const NovaSliderMarkup: SFC<NovaSliderMarkupProps> = props => {
  const { items, SliderItemComponent } = props;

  return (
    <div class="nova-slider">
      <ul>
        {items &&
          items.map((item: SliderItem) => (
            <li>
              <SliderItemComponent
                link={item.link}
                title={item.title}
                summary={item.summary}
              />
            </li>
          ))}
      </ul>
    </div>
  );
};
