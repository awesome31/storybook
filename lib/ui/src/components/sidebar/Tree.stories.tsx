import React from 'react';

import { Tree } from './Tree';
import { stories } from './mockdata.large';
import { DEFAULT_REF_ID } from './data';

export default {
  component: Tree,
  title: 'UI/Sidebar/Tree',
  excludeStories: /.*Data$/,
};

const refId = DEFAULT_REF_ID;
const storyId = Object.values(stories).find((story) => story.isLeaf && !story.isComponent).id;

const log = (id: string) => console.log(id);

export const Full = () => {
  const [selectedId, setSelectedId] = React.useState(storyId);
  return (
    <Tree
      isBrowsing
      isMain
      refId={refId}
      data={stories}
      highlightedId={storyId}
      setHighlightedId={log}
      selectedId={selectedId}
      onSelectId={setSelectedId}
    />
  );
};
