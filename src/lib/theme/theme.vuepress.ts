/**
 * Creates `api-sidebar.json` in `.vuepress` directory.
 * May be used in `.vuepress/config.json` as follows:
 * @example
 * const apiSideBar = require("./api-sidebar.json");
 * // Wiyhout groups
 * module.exports = {
 *   themeConfig: {
 *     sidebar: ["some-content", ...apiSideBar]
 *   }
 * };
 *
 * // With groups
 * module.exports = {
 *   themeConfig: {
 *     sidebar: ["some-content", { title: "API", children: apiSideBar }]
 *   }
 * };
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { RendererEvent } from 'typedoc/dist/lib/output/events';
import { Renderer } from 'typedoc/dist/lib/output/renderer';
import { MarkdownPlugin } from '../plugin';
import { MarkdownTheme } from './theme';

export class VuePressTheme extends MarkdownTheme {
  constructor(renderer: Renderer, basePath: string, options: any) {
    super(renderer, basePath, options);
    this.listenTo(renderer, RendererEvent.END, this.onRendererEnd, 1024);
  }

  onRendererEnd(renderer: RendererEvent) {
    const root = this.findRoot(renderer.outputDirectory);
    if (root === null) {
      this.application.logger.warn(
        `[typedoc-markdown-plugin] sidebars.json not written as could not locate VuePress root directory. In order to to implemnent sidebars.json functionality, the output directory must be a child of a 'docs' directory.`,
      );
      return;
    }
    this.writeSideBar(renderer.outputDirectory, root);
  }

  writeSideBar(outputDirectory: string, root: string) {
    const childDirectory = outputDirectory.split(root + 'docs/')[1];
    const docsRoot = childDirectory ? childDirectory + '/' : '';
    const vuePressRoot = root + 'docs/.vuepress';
    const navObject = this.getNavObject(docsRoot);
    const sidebarPath = vuePressRoot + '/api-sidebar.json';

    if (!fs.existsSync(vuePressRoot)) {
      fs.mkdirSync(vuePressRoot);
    }

    try {
      fs.writeFileSync(sidebarPath, JSON.stringify(navObject, null, 2));
      this.application.logger.write(`[typedoc-plugin-markdown] sidebars.json updated at ${sidebarPath}`);
    } catch (e) {
      this.application.logger.write(`[typedoc-plugin-markdown] failed to update sidebars.json at ${sidebarPath}`);
    }
  }

  getNavObject(docsRoot: string) {
    const projectUrls = [docsRoot + this.indexName.replace('.md', '')];
    if (MarkdownPlugin.project.url === this.globalsName) {
      projectUrls.push(docsRoot + 'globals');
    }

    // const packageName = MarkdownPlugin.project.packageInfo.name;
    const navObject = []; // [{ title: packageName, children: projectUrls }]

    this.navigation.children.forEach(rootNavigation => {
      navObject.push({
        title: rootNavigation.title,
        children: rootNavigation.children.map(item => {
          return docsRoot + item.url.replace('.md', '');
        }),
      });
    });
    return navObject;
  }

  findRoot(outputDirectory: string) {
    const docsName = 'docs';
    function splitPath(dir: string) {
      const parts = dir.split(/(\/|\\)/);
      if (!parts.length) {
        return parts;
      }
      return !parts[0].length ? parts.slice(1) : parts;
    }
    function testDir(parts) {
      if (parts.length === 0) {
        return null;
      }
      const p = parts.join('');
      const itdoes = fs.existsSync(path.join(p, docsName));
      return itdoes ? p : testDir(parts.slice(0, -1));
    }
    return testDir(splitPath(outputDirectory));
  }

  get indexName() {
    return 'index.md';
  }
}
