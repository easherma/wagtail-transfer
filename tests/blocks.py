from wagtail import VERSION as WAGTAIL_VERSION
if WAGTAIL_VERSION >= (3, 0):
    from wagtail.blocks import (
        CharBlock, IntegerBlock, RichTextBlock, StreamBlock, StructBlock, ListBlock, PageChooserBlock
    )
else:
    from wagtail.core.blocks import (
        CharBlock, IntegerBlock, RichTextBlock, StreamBlock, StructBlock, ListBlock, PageChooserBlock
    )


class CaptionedPageLink(StructBlock):
    page = PageChooserBlock(required=False)
    text = CharBlock(max_length=250)


# StreamBlocks
class AnotherStreamBlock(StreamBlock):
    page = PageChooserBlock()


class BaseStreamBlock(StreamBlock):
    """
    Define the custom blocks that `StreamField` will utilize
    """
    link_block = CaptionedPageLink()
    integer = IntegerBlock(required=True)
    page = PageChooserBlock()
    stream = AnotherStreamBlock()
    rich_text = RichTextBlock()
    list_of_pages = ListBlock(PageChooserBlock())
    list_of_captioned_pages = ListBlock(CaptionedPageLink())
