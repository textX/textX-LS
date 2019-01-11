from textx_ls_core.features.completions import get_completions


def test_completions():
    '''Dummy test; will be removed'''
    completion_list = get_completions()
    assert len(completion_list) == 3
