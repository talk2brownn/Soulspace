import storiesVideo from '../Stories.mp4';
import { useState } from 'react';
import './Stories.css';

const moodOptions = [
  { emoji: '😔', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Angry' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '💔', label: 'Heartbroken' },
  { emoji: '😞', label: 'Disappointed' },
  { emoji: '🤯', label: 'Overwhelmed' },
  { emoji: '😶', label: 'Numb' },
];

const therapeuticStories = {
  Sad: `There was a girl named Amara who used to love mornings. She would wake up before her alarm, make tea, and watch the sun come up from her window. But somewhere between one year and the next, mornings became the hardest part of her day. She would lie in bed staring at the ceiling, feeling the weight of something she couldn't name pressing down on her chest. She stopped making tea. She stopped watching sunrises. She just... stopped.

One Tuesday — nothing special about it, no anniversary, no reason — she made tea. Not because she felt better. Not because something changed. She made it because the kettle was there and she was thirsty. She sat by the window and the sun came up anyway, the way it always does, completely indifferent to whether anyone is watching.

She cried that morning. Not from sadness exactly — but from something that felt like recognition. The sun kept rising even when she didn't ask it to. The world kept moving even when she couldn't. And somewhere in that, she found the tiniest thread of comfort — that continuation doesn't require her to be okay first.

She didn't become better that Tuesday. But she made tea on Wednesday too. And that was enough.

You don't have to be okay right now. You just have to make it to the next small thing. The sun will keep rising whether you watch it or not — but on the days you can, it's worth seeing. You have survived every hard day so far. Every single one. That's not nothing. That's everything.`,

  Anxious: `Marcus checked his phone fourteen times in an hour. Not because he was expecting anything — just because the checking felt like doing something, and doing something felt safer than sitting with the feeling that something somewhere was about to go terribly wrong.

He couldn't explain it to anyone. From the outside his life looked fine. From the inside it felt like standing at the edge of something he couldn't see, waiting to fall. His chest was tight. His thoughts moved too fast. He made lists of things that could go wrong and then made lists of the lists.

One evening his neighbour knocked and asked if he had any extra candles — the power was out on the street. Marcus found himself standing in his doorway talking to this woman he barely knew about nothing important — her cat, the weather, whether the power company ever fixed things quickly. Twenty minutes passed. His chest was still tight but somehow lighter. Not fixed. Just — shared.

He realised later that anxiety feeds on isolation. It grows loudest in silence. Connection — even small, even brief, even with a neighbour about candles — has a way of turning the volume down just enough.

What you're feeling is real. The fear is real. But you are not in danger right now — you are just in discomfort, and discomfort always passes. You have felt this before and found your way through. Breathe. You are still here. That means something.`,

  Angry: `Nobody talks about how exhausting anger is. They talk about it like it's fire — dramatic, visible, destructive. But for Kofi, anger felt more like carrying something too heavy for too long. A weight he never asked for, passed down through disappointments and betrayals and moments where he needed someone to show up and they didn't.

He punched a wall once. Regretted it immediately — not because it hurt, but because the wall didn't care. The wall didn't owe him anything. The people who owed him things were elsewhere, living their lives, probably not thinking about him at all. That realization made him angrier and then suddenly, inexplicably, tired.

He started running. Not to be healthy — just to have somewhere to put it. Feet on pavement, breath in lungs, the city moving past. He wasn't less angry after runs. But he was quieter. The anger was still there but it had been used for something — it had moved his body forward instead of turning inward.

Slowly, run by run, he started to separate what he could control from what he couldn't. He couldn't change what happened. He couldn't make people be who he needed them to be. But he could decide what he carried and what he finally, carefully, put down.

Your anger is telling you something important — that something mattered, that you deserved better, that something was unfair. That message is valid. You don't have to suppress it. But you also don't have to let it be the only voice in the room. You are more than what was done to you.`,

  Tired: `Fatigue that comes from the soul is different from the kind that sleep fixes. Lena knew this. She slept nine hours and woke up exhausted. She took weekends off and came back Monday feeling like she'd never left. The tiredness lived somewhere deep — not in her muscles or her eyes but somewhere closer to the centre of her.

She went through the motions beautifully. Nobody knew. She smiled at the right moments, said the right things, showed up where she was supposed to show up. At night she would sit on the edge of her bed and feel the strange grief of being tired of everything without being able to say exactly what everything was.

Her doctor said rest. Her friends said vacation. She nodded at both because it was easier than explaining that she wasn't tired of doing things — she was tired of feeling like she was disappearing.

One Sunday she sat in a garden — not her garden, just a garden in a park — and watched a very old man feed pigeons with extraordinary patience. One pigeon kept missing the bread. He kept throwing more. She watched him for twenty minutes. He never got frustrated. He just kept throwing bread, like there was nowhere else to be and nothing more important to do.

She didn't know why that helped. But something in her chest unclenched slightly.

You are allowed to be tired. You don't have to perform wellness. Rest isn't giving up — it's maintenance. The world will still be there after you've been gentle with yourself. You matter even when you're running on empty. Especially then.`,

  Heartbroken: `The strange thing about heartbreak is how physical it is. Yemi hadn't expected that. She expected sadness — she got something that felt like her body was trying to process something it didn't have the right organs for. Her appetite disappeared. She woke at 3am for no reason. She lost words mid-sentence and forgot them entirely.

She kept reaching for her phone to tell him things. A funny sign she saw. A song that came on. The specific shade of the sky at 6pm on a Wednesday. Then she'd remember and the remembering felt like a small death each time, except you don't get to only die once with heartbreak. You die a little every time you forget for a moment that things have changed.

Her grandmother told her once that the heart is the only muscle that gets stronger from breaking. At the time Yemi thought that was something people say. Now she thought maybe there was something to it — not because pain is good but because surviving it changes you. Softens the parts that were too rigid. Cracks you open in places that needed light.

She was not okay. But she was still herself — still someone who noticed the sky at 6pm, still someone who wanted to share beautiful things. That part, she realized, belonged to her. It was never his to take.

What you loved was real. What you lost was real. Grieve it fully — don't rush past it or talk yourself out of it. But know this: the capacity to love that deeply is yours. It didn't leave with them. It's still here, waiting for you to be ready again.`,

  Disappointed: `James had a plan. He always had a plan. Plans made the future feel manageable — like if he prepared enough, hoped carefully enough, worked hard enough, the outcome would cooperate. This time the outcome didn't cooperate.

He sat with it for days — the particular silence of a thing you wanted not happening. He replayed the moments before. Wondered what he could have done differently. Constructed alternate timelines in his head where he said the right thing, made the right choice, and the story ended differently.

A mentor of his said something once that James hadn't understood at the time: "Disappointment is just the distance between your expectation and reality. Sometimes that distance is information." He thought about that now. What was this telling him? Not that he failed — but maybe that this particular door wasn't his door. That the energy spent grieving this path might be energy that belonged to a different one.

He didn't feel better immediately. But he started, slowly, to get curious instead of defeated. What if this wasn't the end of the story? What if this was just the part before things got interesting?

You are allowed to be disappointed. You worked for something and it didn't come through — that deserves to be felt, not suppressed. But disappointment is not a verdict on your worth or your future. It is a moment. Moments pass. The next chapter hasn't been written yet.`,

  Overwhelmed: `Everything needed to happen at once and Sofia was one person. She stood in her kitchen one morning surrounded by undone things — unanswered messages, unfinished work, unpaid bills, unresolved conversations — and felt the particular paralysis that comes not from having nothing to do but from having too much. She couldn't start because she didn't know where to start. So she stood there.

She made coffee. Not because coffee would fix anything — but because it was small and completable and her hands knew how to do it without her brain having to try. She drank it standing up, looking out the window at a tree she'd never really looked at before. It was just a tree. Doing tree things. Completely unconcerned with her inbox.

She wrote one thing on a piece of paper. Not a list — just one thing. The most important thing, or the smallest thing, or the thing that had been loudest in her head. She did that one thing. Then she wrote another.

She didn't finish everything that day. She didn't fix the overwhelm. But she moved through it instead of being swallowed by it, and that was different from before.

You cannot do everything at once. No one can. The overwhelm you feel is not weakness — it's a signal that you're carrying more than one person should carry alone. Put it down for a moment. Breathe. Pick up just one thing. You don't have to solve everything today. You just have to do the next small thing. That's always enough.`,

  Numb: `Daniel felt nothing and that scared him more than feeling something bad would have. At least sadness had texture. At least anger had direction. This — this flatness — felt like standing behind glass watching his own life happen to someone else.

He went to work. He ate. He responded to messages with the right words in the right order. From the outside he looked fine. From the inside there was just — quiet. A quiet that wasn't peaceful. A quiet that felt like waiting for something he couldn't name.

His therapist told him once that numbness is often protection. That when the nervous system has processed too much, it sometimes draws the curtains — not to abandon you, but to give you time. That underneath the numbness, feeling was still there. Just resting. Just waiting until it felt safe to come back.

He didn't know if that was true. But he started doing small things that used to mean something — not because they felt meaningful now, but as an act of faith that they might again. He walked the route he used to love. He put on music that used to move him. He kept showing up for his own life even when his own life felt like a stranger.

One morning he looked at the sky and felt something. Small. Brief. Like a single note before a song begins.

If you feel nothing right now, that's okay. You are not broken. You are protected. The feelings will come back — they always do. Until then, be gentle with yourself. Keep showing up. Keep doing small things that once mattered. The music will come back. It always does.`
};

function Stories() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateStory() {
    if (!selectedMood) return;
    setLoading(true);
    setStory('');

    await new Promise(resolve => setTimeout(resolve, 2000));
    setStory(therapeuticStories[selectedMood.label] || therapeuticStories['Sad']);
    setLoading(false);
  }

  return (
    <div className="stories">
      <div className="stories-header">
        <h1>📖 Mood Stories</h1>
        <p>A story just for you, based on how you feel right now 💙</p>
      </div>

      <div className="video-background">
  <video autoPlay loop muted playsInline>
    <source src={storiesVideo} type="video/mp4" />
  </video>
</div>

      <div className="stories-content">
        <div className="mood-selector">
          <h3>How are you feeling right now?</h3>
          <div className="mood-options">
            {moodOptions.map((mood) => (
              <button
                key={mood.label}
                className={`mood-option ${selectedMood?.label === mood.label ? 'active' : ''}`}
                onClick={() => setSelectedMood(mood)}
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <button className="generate-btn" onClick={generateStory}>
              {loading ? '✨ Finding your story...' : '✨ Read My Story'}
            </button>
          )}
        </div>

        {loading && (
          <div className="story-loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Finding a story just for you... 💙</p>
          </div>
        )}

        {story && !loading && (
          <div className="story-card">
            <div className="story-mood-tag">
              {selectedMood.emoji} A story for when you feel {selectedMood.label}
            </div>
            <div className="story-text">
              {story.split('\n').map((paragraph, i) => (
                paragraph && <p key={i}>{paragraph}</p>
              ))}
            </div>
            <button className="new-story-btn" onClick={() => { setStory(''); setSelectedMood(null); }}>
              ✨ Read Another Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stories;