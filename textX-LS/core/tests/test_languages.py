from textx_ls_core.languages import textx, textxfile


def test_textx_language_template():
    tx_template = textx.TextXLang()

    assert 'tx' in tx_template.extensions
    assert tx_template.language_name == 'TextX'
    assert tx_template.metamodel is not None


def test_textxfile_language_template():
    tx_template = textxfile.TextxfileLang()

    assert 'textxfile' in tx_template.extensions
    assert tx_template.language_name == 'Textxfile'
    assert tx_template.metamodel is not None
