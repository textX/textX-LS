import pytest
from textx_ls_core.languages import LanguageTemplate


@pytest.fixture(scope="session", autouse=True)
def lang_template():
    """Test language template fixture."""
    class TestLangTemplate(LanguageTemplate):
        @property
        def extensions(self):
            return ['.test']

        @property
        def language_name(self):
            return 'testlang'

    return TestLangTemplate()
