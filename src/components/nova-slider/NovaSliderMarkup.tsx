import { FunctionalComponent as SFC, h } from "@stencil/core";
import { SliderItem } from "./models";

interface NovaSliderMarkupProps {
  mode: string;
  variant: string;
  axis: string;
  items: SliderItem[];
  SliderItemComponent: any;
  gutter: number;
  perView: number;
}

export const NovaSliderMarkup: SFC<NovaSliderMarkupProps> = props => {
  const { items, SliderItemComponent, gutter } = props;


  const itemStyle = {
    paddingRight: `${gutter}px`
  };



  return (
    <div class="nova-slider">
      <ul class="nova-slider__items">
        {items &&
          items.map((item: SliderItem) => (
            <li style={itemStyle} class="nova-slider__item">
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
