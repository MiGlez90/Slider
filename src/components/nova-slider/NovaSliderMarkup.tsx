import { FunctionalComponent as SFC, h } from "@stencil/core";
import { SliderItem } from "./models";
import { MODE } from "./default-configuration";

interface NovaSliderMarkupProps {
  animateNormal: string;
  cloneCount: number;
  mode: string;
  variant: string;
  axis: string;
  items: SliderItem[];
  SliderItemComponent: any;
  gutter: number;
  perView: number;
  slideId: string;
  autoWidth: boolean;
  autoHeight: boolean;
  isPercentageLayoutSupported: boolean;
  calcPrefixCSS: string | boolean;
  containerStyle: any;
  itemStyle: any;
}

export const NovaSliderMarkup: SFC<NovaSliderMarkupProps> = props => {
  const { items, SliderItemComponent, slideId } = props;
  const { autoWidth, isPercentageLayoutSupported, calcPrefixCSS } = props;
  const { autoHeight, axis, mode } = props;
  const { animateNormal, cloneCount, containerStyle } = props;
  const { itemStyle } = props;
  const isCarousel = mode === MODE.CAROUSEL.valueOf();

  const slideCount = items.length;

  const outerId = `${slideId}-ow`;
  const middleId = `${slideId}-mw`;
  const innerId = `${slideId}-iw`;

  let itemsContainerClass = "nova-slider__items";
  itemsContainerClass +=
    isPercentageLayoutSupported || autoWidth
      ? " tns-subpixel"
      : " tns-no-subpixel";
  itemsContainerClass += calcPrefixCSS ? " tns-calc" : " tns-no-calc";
  itemsContainerClass += autoWidth ? " tns-autowidth" : "";
  itemsContainerClass += ` tns-${axis}`;

  let autoHeightClass = autoHeight ? " tns-ah" : "";
  const animateNormalClass = !isCarousel && animateNormal ? animateNormal : "";

  let clonedItemsBefore = [];
  let clonedItemsAfter = [];

  for (let j = cloneCount; j--; ) {
    let num = j % slideCount;
    let cloneFirst = items[num];
    clonedItemsAfter.push(cloneFirst);

    if (isCarousel) {
      let cloneLast = items[slideCount - 1 - num];
      clonedItemsBefore.push(cloneLast);
    }
  }

  const InnerMarkup = (
    <div>
      <ul style={containerStyle} class={itemsContainerClass} id={slideId}>
        {clonedItemsBefore.map((item: SliderItem) => (
          <li
            aria-hidden="true"
            tabindex={-1}
            style={itemStyle}
            class={`nova-slider__item tns-item ${animateNormalClass}`}
          >
            <SliderItemComponent
              link={item.link}
              title={item.title}
              summary={item.summary}
            />
          </li>
        ))}
        {items &&
          items.map((item: SliderItem, index: number) => (
            <li
              aria-hidden="true"
              tabIndex={-1}
              style={itemStyle}
              class={`nova-slider__item tns-item ${animateNormalClass}`}
              id={`${slideId}-item${index}`}
            >
              <SliderItemComponent
                link={item.link}
                title={item.title}
                summary={item.summary}
              />
            </li>
          ))}
        {clonedItemsAfter.reverse().map((item: SliderItem) => (
          <li
            aria-hidden="true"
            tabindex={-1}
            style={itemStyle}
            class={`nova-slider__item tns-item ${animateNormalClass}`}
          >
            <SliderItemComponent
              link={item.link}
              title={item.title}
              summary={item.summary}
            />
          </li>
        ))}
      </ul>
      <div class="nova-c-carousel__arrows nova-js-carousel__arrows">
        <button class="nova-c-carousel__arrow nova-c-carousel__arrow--left">
          <nova-font-awesome iconName="chevron-left" size="2x" />
        </button>
        <button class="nova-c-carousel__arrow nova-c-carousel__arrow--right">
          <nova-font-awesome iconName="chevron-right" size="2x" />
        </button>
      </div>
    </div>
  );

  if (isCarousel) {
    return (
      <div class="nova-slider tns-outer" id={outerId}>
        <div class={`tns-ovh ${autoHeightClass}`} id={middleId}>
          <div class="tns-inner" id={innerId}>
            {InnerMarkup}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="nova-slider tns-outer" id={outerId}>
      <div class={`tns-inner ${autoHeightClass}`} id={innerId}>
        {InnerMarkup}
      </div>
    </div>
  );
};
