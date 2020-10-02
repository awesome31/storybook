import { styled } from '@storybook/theming';
import { Icons } from '@storybook/components';
import { DOCS_MODE } from 'global';
import React, { FunctionComponent, MouseEventHandler, ReactNode, useCallback } from 'react';
import { ControllerStateAndHelpers } from 'downshift';

import { ComponentNode, DocumentNode, Path, RootNode, StoryNode } from './TreeNode';
import { Match, DownshiftItem, isExpandType, SearchResult } from './types';
import { storyLink } from './utils';

const ResultsList = styled.ol({
  listStyle: 'none',
  margin: 0,
  marginLeft: -20,
  marginRight: -20,
  padding: 0,
});

const ResultRow = styled.li<{ isHighlighted: boolean }>(({ theme, isHighlighted }) => ({
  display: 'block',
  margin: 0,
  padding: 0,
  background: isHighlighted ? `${theme.color.secondary}11` : 'transparent',
  cursor: 'pointer',
}));

const ShowMore = styled.span(({ theme }) => ({
  color: theme.color.mediumdark,
  fontSize: `${theme.typography.size.s1}px`,
}));

const Mark = styled.mark(({ theme }) => ({
  background: 'transparent',
  color: theme.color.secondary,
}));

const PlusIcon = styled(Icons)(({ theme }) => ({
  display: 'inline-block',
  width: 10,
  height: 10,
  marginRight: 5,
  color: theme.color.mediumdark,
}));

const Highlight: FunctionComponent<{ match?: Match }> = React.memo(({ children, match }) => {
  if (!match) return <>{children}</>;
  const { value, indices } = match;
  const { nodes: result } = indices.reduce<{ cursor: number; nodes: ReactNode[] }>(
    ({ cursor, nodes }, [start, end], index, { length }) => {
      /* eslint-disable react/no-array-index-key */
      nodes.push(<span key={`${index}-0`}>{value.slice(cursor, start)}</span>);
      nodes.push(<Mark key={`${index}-1`}>{value.slice(start, end + 1)}</Mark>);
      if (index === length - 1) {
        nodes.push(<span key={`${index}-2`}>{value.slice(end + 1)}</span>);
      }
      /* eslint-enable react/no-array-index-key */
      return { cursor: end + 1, nodes };
    },
    { cursor: 0, nodes: [] }
  );
  return <>{result}</>;
});

const Result: FunctionComponent<
  SearchResult & { icon: string; isHighlighted: boolean; onClick: MouseEventHandler }
> = React.memo(({ item, matches, icon, onClick, ...props }) => {
  const click: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      onClick(event);
    },
    [onClick]
  );

  const nameMatch = matches.find((match: Match) => match.key === 'name');
  const pathMatches = matches.filter((match: Match) => match.key === 'path');
  const label = (
    <div>
      <strong>
        <Highlight match={nameMatch}>{item.name}</Highlight>
      </strong>
      {item.path && (
        <Path>
          {item.path.map((group, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={index}>
              <Highlight match={pathMatches.find((match: Match) => match.arrayIndex === index)}>
                {group}
              </Highlight>
            </span>
          ))}
        </Path>
      )}
    </div>
  );

  if (DOCS_MODE) {
    return (
      <ResultRow {...props}>
        <DocumentNode depth={0} onClick={click} href={storyLink(item.id, item.refId)}>
          {label}
        </DocumentNode>
      </ResultRow>
    );
  }

  const TreeNode = item.isComponent ? ComponentNode : StoryNode;
  return (
    <ResultRow {...props}>
      <TreeNode isExpanded={false} depth={0} onClick={onClick}>
        {label}
      </TreeNode>
    </ResultRow>
  );
});

export const SearchResults: FunctionComponent<{
  isSearching: boolean;
  results: DownshiftItem[];
  getMenuProps: ControllerStateAndHelpers<DownshiftItem>['getMenuProps'];
  getItemProps: ControllerStateAndHelpers<DownshiftItem>['getItemProps'];
  highlightedIndex: number | null;
}> = React.memo(({ isSearching, results, getMenuProps, getItemProps, highlightedIndex }) => {
  return (
    <ResultsList {...getMenuProps()}>
      {results.length > 0 && !isSearching && (
        <li>
          <RootNode>Recently opened</RootNode>
        </li>
      )}
      {results.map((result: DownshiftItem, index) => {
        if (isExpandType(result)) {
          return (
            <ResultRow
              {...result}
              {...getItemProps({ key: index, index, item: result })}
              isHighlighted={highlightedIndex === index}
              style={{ paddingLeft: 19 }}
            >
              <PlusIcon icon="plus" />
              <ShowMore>Show all ({result.totalCount} results)</ShowMore>
            </ResultRow>
          );
        }

        const { item } = result;
        const key = `${item.refId}::${item.id}`;
        return (
          <Result
            {...result}
            {...getItemProps({ key, index, item: result })}
            isHighlighted={highlightedIndex === index}
          />
        );
      })}
    </ResultsList>
  );
});
