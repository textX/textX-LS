def codegen(m):
    txt = "@startuml\n"
    for a in m.algos:
        txt += "component {}\n".format(a.name)
    for f in m.flows:
        txt += '{} "{}" #--# {}\n'.format(f.algo1.name, f.algo1.outp.name,
                                          f.algo2.name)
    txt += "@enduml\n"
    return txt
