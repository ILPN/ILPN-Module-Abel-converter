export interface Graph {
    forEachNode: (f: (n: Node) => void) => void
    forEachLink: (f: (l: Link) => void) => void
}

export interface Node {
    id: string
    data: {
        label: string
    }
}

export interface Link {
    fromId: string;
    toId: string;
    id: string;
}
