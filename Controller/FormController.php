<?php

namespace EMS\FormBundle\Controller;

use EMS\FormBundle\Components\Form;
use EMS\SubmissionBundle\Submission\SubmitResponse;
use EMS\SubmissionBundle\Service\SubmissionClient;
use Symfony\Component\Form\FormFactory;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Twig\Environment;

class FormController
{
    /** @var FormFactory */
    private $formFactory;
    /** @var SubmissionClient */
    private $submissionClient;
    /** @var Environment */
    private $twig;

    public function __construct(FormFactory $formFactory, SubmissionClient $submissionClient, Environment $twig)
    {
        $this->formFactory = $formFactory;
        $this->submissionClient = $submissionClient;
        $this->twig = $twig;
    }

    public function iframe(Request $request, $ouuid)
    {
        $form = $this->formFactory->create(Form::class, [], ['ouuid' => $ouuid, 'locale' => $request->getLocale()]);

        return new Response($this->twig->render('@EMSForm/iframe.html.twig', [
            'config' => $form->getConfig()->getOption('config'),
        ]));
    }

    public function jsonForm(Request $request, $ouuid)
    {
        $form = $this->formFactory->create(Form::class, [], ['ouuid' => $ouuid, 'locale' => $request->getLocale()]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var SubmitResponse $response */
            $response = $this->submissionClient->submit($form);
            return new JsonResponse([
                'instruction' => 'submitted',
                'response' => \json_encode($response->getResponses()),
            ]);
        }

        return new JsonResponse([
            'instruction' => 'form',
            'response' => $this->twig->render('@EMSForm/form.html.twig', ['form' => $form->createView()]),
        ]);
    }
}
