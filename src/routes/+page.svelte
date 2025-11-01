<script lang="ts">
	import { mode, setMode } from 'mode-watcher';
	import { basicSetup, EditorView } from 'codemirror';
	import { Button } from "$lib/components/ui/button/index.js";
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { toast } from "svelte-sonner";
	import { EditorState } from '@codemirror/state';
	import { onMount } from 'svelte';
	import { json } from '@codemirror/lang-json';
	import { githubLight } from '@ddietr/codemirror-themes/github-light';
	import { githubDark } from '@ddietr/codemirror-themes/github-dark';
	import { quotes } from '@/quotes';
	import { fixJsonInput } from '@/utils';
	import { Copy, Download, Trash } from '@lucide/svelte';

	function updateResultJson(newJson: string, editorView: EditorView | null) {
		resultJson = newJson;
		if (editorView) {
			editorView.dispatch({
				changes: {
					from: 0,
					to: editorView.state.doc.length,
					insert: resultJson
				}
			});
		}
	}

	function copyToClipboard() {
		if (resultJson && !hasError) {
			navigator.clipboard.writeText(resultJson);
			toast.success('Copied to clipboard!');
		} else {
			toast.error('Nothing to copy!');
		}
	}

	function clearInput() {
		inputJson = '';
	}

	function downloadJson() {
		const blob = new Blob([resultJson], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'formatted.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
	let editorView: EditorView | null = $state(null);
	let inputJson = $state('');
	let resultJson = $state('');
	let hasError = $state(false);
	// on inputJson change, calculate the fixed json and update the editor with derived state
	$effect(() => {
		if (editorView) {
			if (!inputJson || inputJson.trim() === '') {
				updateResultJson(JSON.stringify(randomQuote, null, 2), editorView);
				hasError = false;
				return;
			}
			try {
				const parsed = JSON.parse(fixJsonInput(inputJson));
				updateResultJson(JSON.stringify(parsed, null, 2), editorView);
				hasError = false;
			} catch (e: any) {
				updateResultJson(`Invalid JSON: ${e.message}`, editorView);
				hasError = true;
			}
		}
	});

	onMount(() => {
		const editor = document.getElementById('editor-code-mirror');
		if (!editor) {
			return;
		}
		editorView = new EditorView({
			doc: JSON.stringify(randomQuote, null, 2),
			parent: editor,
			extensions: [
				basicSetup,
				json(),
				EditorState.readOnly.of(true),
				EditorView.editable.of(false),
				EditorView.contentAttributes.of({ tabindex: '0' }),
				mode.current === 'dark' ? githubDark : githubLight
			]
		});
	});
</script>

<div class="flex flex-col w-full h-screen gap-4">
	<div class="mx-4 mt-4">
		<Textarea class="max-h-40" placeholder={JSON.stringify(randomQuote)} bind:value={inputJson} />
	</div>
	<Card.Root class="mx-4 max-w-full h-full">
		<Card.Content class="min-h-full">
			<div id="editor-code-mirror"></div>
		</Card.Content>
	</Card.Root>
	<div class="flex justify-center flex-wrap mx-4 mb-4">
		<Button variant="outline" onclick={clearInput} disabled={inputJson.trim() === ''}>
			<Trash class="mr-2" />
			Clear
		</Button>
		<Button variant="outline" class="ml-4" onclick={downloadJson} disabled={hasError}>
			<Download class="mr-2" />
			Download
		</Button>
		<Button variant="outline" class="ml-4" onclick={copyToClipboard} disabled={hasError}>
			<Copy class="mr-2" />
			Copy
		</Button>
	</div>
</div>
