# kibana-chord

(WIP) A Chord Diagram Kibana plugin. Designed to work with

 * ElasticSearch version 2.2
 * Kibana version 4.4

### Installation

To install this plugin to your Kibana instance, you can use the following commands:

```bash
git clone https://github.com/datavis-tech/kibana-chord.git
zip -r --exclude=*.git* kibana-chord.zip kibana-chord
kibana plugin --install kibana-chord -u file://`pwd`/kibana-chord.zip
```

To update to a newer version of this plugin:

```bash
kibana plugin --remove kibana-chord
cd kibana-chord
git pull
cd ..
zip -r --exclude=*.git* kibana-chord.zip kibana-chord
kibana plugin --install kibana-chord -u file://`pwd`/kibana-chord.zip
```

### Usage

**Note** Currently, this is only a skeleton of a plugin that shows a configurable query.

Once installed, you should see an option to open this plugin that looks like this.

![image](https://cloud.githubusercontent.com/assets/68416/16712519/5ae8c850-46a7-11e6-93e6-2b57588bbc15.png)

Once you open the plugin, you can change the query configuration to specify:

 * Chord Weight
 * Chord Source
 * Chord Destination

### Related Resources

 * [Official Documentation - Kibana Plugins Documentation for v4.4](https://www.elastic.co/guide/en/kibana/4.4/kibana-plugins.html)
 * [Tutorial - Writing Kibana 4 Plugins – Simple Visualizations](https://www.timroes.de/2015/12/02/writing-kibana-4-plugins-simple-visualizations/) Introduces [timroes/tr-k4p-clock](https://github.com/timroes/tr-k4p-clock).
 * [Tutorial - Writing Kibana 4 Plugins – Visualizations using Data](https://www.timroes.de/2015/12/06/writing-kibana-4-plugins-visualizations-using-data/) Introduces [timroes/tr-k4p-tagcloud](https://github.com/timroes/tr-k4p-tagcloud).
 * [d3-chord](https://github.com/d3/d3-chord)
 * [Mike Bostock’s Block - Chord Diagram](http://bl.ocks.org/mbostock/4062006) Canonical example.
 * [Mike Bostock’s Block - Chord Diagram (Flare Imports)](http://bl.ocks.org/mbostock/1046712)
 * [Nadieh Bremer’s Block - Avenger Movie Collaborations](http://bl.ocks.org/nbremer/864b11eb83aac3a1f6a2) Shows nice hover interactions.
 * [Nadieh Bremer’s Block - Chord diagram 2014 - End result](http://bl.ocks.org/nbremer/7d0a91497fc64f30d1ab)
