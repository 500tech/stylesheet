const postcss = require('postcss');
const parser = require('postcss-selector-parser');
const _ = require('lodash/fp');
const appendAttribute = require('./append-attribute');
const appendAttr = require('./append-attr');

/**
 * @param {Object} options
 * @param {function} options.onComponent
 * @param {function} options.onProp
 * @param {function} options.onAttr
 */
module.exports = postcss.plugin('stylesheet', ({ onComponents, id }) => {
  return (root, result) => {
    let allComponents = {};
    result.root.walkRules(/\b[A-Z]/, rule => {
      const blockComponents = new Set();
      let components = {};
      const parseComponentTagsAndAttributesSelectors = selectorRoot => {
        for (const selector of selectorRoot.nodes) {
          for (const tag of selector.nodes.filter(matchComponentTags)) {
            const tagIndex = selector.nodes.indexOf(tag);
            const componentName = tag.value;
            const componentClassName = `${ componentName }_${ id }`;
            const nextCombinatorIndex = findNextCombinatorIndexFrom(tagIndex, selector.nodes);
            const attributeNodes = getAttributeNodes(tagIndex, nextCombinatorIndex, selector.nodes);
            components = _.set([componentName, 'className'], componentClassName, components);
            if (nextCombinatorIndex === -1) {
              blockComponents.add(componentName);
            }
            for (const node of attributeNodes) {
              components = appendAttribute(id, components, componentName, node);
            }
            tag.replaceWith(parser.className({ value: componentClassName }));
          }
        }
      };
      try {
        rule.selector = parser(parseComponentTagsAndAttributesSelectors).process(
          rule.selector
        ).result;
      } catch (err) {
        if (err.message !== 'Expected pseudo-class or pseudo-element') {
          throw err;
        }
      }
      if (blockComponents.size) {
        rule.walkDecls(decl => {
          if (isAttr(decl.value)) {
            for (const component of blockComponents) {
              components = appendAttr(components, component, rule, decl);
            }
          }
        });
        rule.walkAtRules('apply', atRule => {
          if (isElementBase(atRule)) {
            for (const component of blockComponents) {
              components = _.set([component, 'base'], atRule.params, components);
              atRule.remove();
            }
          }
        });
      }
      allComponents = _.merge(allComponents, components);
    });
    onComponents(allComponents);
  };
});

const and = _.curry((predicates, value) => _.every(predicate => predicate(value), predicates));

const isComponentElement = ({ value }) => value.search(/[A-Z]/) === 0;
const isAttr = value => value.search(/attr\(.+?\)/) !== -1;
const isElementBase = ({ params }) => params.search(/[A-z]/) === 0;

const matchComponentTags = and([_.matches({ type: 'tag' }), isComponentElement]);

const findNextCombinatorIndexFrom = _.findIndexFrom({ type: 'combinator' });

const getAttributeNodes = (tagIndex, nextCombinatorIndex, nodes) =>
  _.flow([_.slice(tagIndex, nextCombinatorIndex), _.filter({ type: 'attribute' })])(nodes);
