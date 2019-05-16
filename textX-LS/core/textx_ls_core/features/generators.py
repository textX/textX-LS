from textx import generator_descriptions


def get_generators():
    return [
        gen for target_gens in generator_descriptions().values() for gen in target_gens.values()
    ]
